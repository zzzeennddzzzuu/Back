import { Injectable } from '@nestjs/common';
import { LinkDto } from '../models/link.dto';
import { Links, LinksDoc } from '../schema/links.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

function setExpirationTime(days = 0) {
  const today = new Date();
  return new Date(today.setDate(today.getDate() + days));
}

@Injectable()
export class LinkService {
  constructor(
    @InjectModel(Links.name)
    private readonly linkModel: Model<LinksDoc>,
  ) {}

  async createLink(body: LinkDto & { email: string }) {
    const shorterLink = randomUUID().slice(0, 8);  
    const expiredAt = setExpirationTime(5); 
    const linkDoc = new this.linkModel({
      ...body, originalLink: body.originalLink, shortLink: shorterLink, expiredAt
    });
    return linkDoc.save();
  }

  async getExpired(query, user) {
    const data = JSON.parse(query.expiredAt);
    if (!data.gt && !data.lt) {
      throw new Error('No expiration date provided.');
    }

    const filters = { email: user.email };
    if (data.gt) filters['expiredAt.$gt'] = new Date(data.gt);
    if (data.lt) filters['expiredAt.$lt'] = new Date(data.lt);

    return this.linkModel.aggregate([
      { $match: filters },
    ]);
  }

  async getLink(shortLink) {
    const linkDoc = await this.linkModel.findOne({ shortLink });
    if (!linkDoc) {
      throw new Error('Short link was not found');
    }

    const today = setExpirationTime();
    if (linkDoc.expiredAt < today) {
      throw new Error('Link has expired');
    }

    return linkDoc.originalLink;
  }
}