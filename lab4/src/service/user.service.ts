import { Injectable } from '@nestjs/common';
import { LoginDto, UserDto } from '../models';
import { UserDoc, Users } from '../schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

function setExpirationTime(days = 0) {
  const today = new Date();
  return new Date(today.setDate(today.getDate() + days));
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name)
    private readonly userModel: Model<UserDoc>,
  ) {}

  async createUser(body: UserDto) {
    const existingUser = await this.userModel.findOne({ email: body.email });
    if (existingUser) {
      throw new Error(`User with email ${body.email} already exists`);
    }

    body.token = randomUUID();
    body.creationTime = setExpirationTime();  

    const newUser = new this.userModel(body);
    await newUser.save();
    return newUser.toObject();  
  }

  async login(body: LoginDto) {
    const user = await this.userModel.findOne({
      email: body.email,
      password: body.password,
    });

    if (!user) {
      throw new Error(`No user found with email ${body.email}`);
    }

    user.token = randomUUID();  
    await user.save();
    return user.toObject();  
  }

  async getAllUsers() {
    const users = await this.userModel.find({});
    return users.map(user => user.toObject());  
  }
}
