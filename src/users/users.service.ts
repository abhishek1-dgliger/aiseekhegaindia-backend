import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

export type GoogleProfileInput = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async upsertFromGoogle(profile: GoogleProfileInput): Promise<UserDocument> {
    const user = await this.userModel
      .findOneAndUpdate(
        { googleId: profile.googleId },
        {
          $set: {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
          },
          $setOnInsert: { googleId: profile.googleId },
        },
        { upsert: true, new: true },
      )
      .exec();

    return user;
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!id || !isValidObjectId(id)) {
      return null;
    }
    return this.userModel.findById(id).exec();
  }
}
