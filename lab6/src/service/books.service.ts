import { Injectable } from '@nestjs/common';
import { BooksDto } from '../models';
import { Books, BooksDoc, Pages, PagesDoc, UserDoc, Users, Parts, PartsDoc, PartAccessTokens, PartAccessTokensLeanDoc } from '../schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SplitToPartService } from './splitToParts.service';
import { randomUUID } from 'crypto';
import { OtpNotMatch } from 'src/shared';

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Books.name) private readonly bookModel: Model<BooksDoc>,
    @InjectModel(Users.name) private readonly userModel: Model<UserDoc>,
    @InjectModel(Pages.name) private readonly pageModel: Model<PagesDoc>,
    @InjectModel(Parts.name) private readonly partModel: Model<PartsDoc>,
    @InjectModel(PartAccessTokens.name) private readonly partAccessTokensModel: Model<PartAccessTokensLeanDoc>,
  ) {}

  async createBook(body: BooksDto & { login: string }) {
    const user = await this.userModel.findOne({ login: body.login });
    const book = await new this.bookModel({
      title: body.title,
      userId: user._id,
      totalPageNumber: body.pageLinks.length,
    }).save();

    const pagesData = body.pageLinks.map((e, index) => ({ ...e, pageNumber: index + 1 }));
    const splitService = new SplitToPartService();

    for (const pageData of pagesData) {
      const coordinates = await splitService.split(pageData.pageLink);
      const page = await new this.pageModel({
        bookId: book._id,
        url: pageData.pageLink,
        pageNumber: pageData.pageNumber,
        TotalCount: 0,
      }).save();

      const partDocs = coordinates.map(coordinate => ({
        pictureId: page._id,
        box: coordinate,
        options: [],
      }));
      await this.partModel.insertMany(partDocs);
    }
    return book;
  }

  async getBook(user) {
    return this.bookModel.find({ userId: user._id });
  }

  async getParts() {
    const randomPart = await this.partModel.aggregate([{ $sample: { size: 1 } }]);
    const part = await this.partModel.findById(randomPart[0]._id);
    const page = await this.pageModel.findById(part.pictureId);

    const token = new this.partAccessTokensModel({
      partId: part._id,
      otp: randomUUID(),
    });
    await token.save();

    return {
      partId: part._id,
      imageUrl: page.url,
      otp: token.otp,
      box: part.box,
    };
  }

  async postParts(partId, body) {
    const isMatch = await this.partAccessTokensModel.findOne({
      otp: body.otp,
      partId: partId,
    });

    if (!isMatch) {
      throw new OtpNotMatch('Part id do not match with otp');
    }

    await this.partAccessTokensModel.updateOne(
      { otp: body.otp, partId: partId },
      { $unset: { otp: 1 } },
    );

    const updateQuery = { _id: partId, 'options.text': body.text };
    const updatedPart = await this.partModel.findOneAndUpdate(
      updateQuery,
      { $inc: { 'options.$.count': 1 } },
      { new: true, upsert: true },
    );

    if (!updatedPart) {
      const newPart = await this.partModel.findOneAndUpdate(
        { _id: partId },
        { $push: { options: { text: body.text, count: 1 } } },
        { new: true },
      );
      console.log(newPart.toObject());
      return body.text;
    }

    const incTotalCounter = await this.pageModel.findByIdAndUpdate(
      updatedPart.pictureId,
      { $inc: { TotalCount: 1 } },
      { new: true },
    );
    console.log(incTotalCounter);
    console.log(updatedPart);
    return body.text;
  }
}
