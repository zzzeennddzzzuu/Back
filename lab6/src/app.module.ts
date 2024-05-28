import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserService } from './service/user.service';
import { BookService } from './service/books.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Books,
  BooksSchema,
  Users,
  UserSchema,
  Pages,
  PagesSchema,
  Parts,
  PartsSchema,
  PartAccessTokens,
  PartAccessTokensSchema,
} from './schema';
import { UserAuthorizationMiddleware } from './midellware/userAuthorization.middleware';
import { SplitToPartService } from './service/splitToParts.service';
import { BooksController } from './controllers/books.controller';


@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://newide:4errty09nmcfg@ihatemylife.jrambdc.mongodb.net/?retryWrites=true&w=majority&appName=Ihatemylife',
      { dbName: 'ihatemylife' },
    ),
    MongooseModule.forFeature([
      {
        name: Users.name,
        schema: UserSchema,
      },
      {
        name: Books.name,
        schema: BooksSchema,
      },
      {
        name: Pages.name,
        schema: PagesSchema,
      },
      {
        name: Parts.name,
        schema: PartsSchema,
      },
      {
        name: PartAccessTokens.name,
        schema: PartAccessTokensSchema,
      },
    ]),
  ],
  controllers: [UsersController, BooksController],

  providers: [UserService, BookService, SplitToPartService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserAuthorizationMiddleware).exclude().forRoutes('/books');
  }
}

