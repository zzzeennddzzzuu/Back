import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ collection: 'orders' })
export class Orders {
  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: Number, required: false })
  distance?: number;
  
  @Prop({ type: String, required: false })
  type?: string;

  @Prop({ type: String, required: false })
  status?: string;
}

export const OrdersSchema = SchemaFactory.createForClass(Orders);

export type OrdersLeanDoc = Orders & { _id: Types.ObjectId };
export type OrdersDoc = Orders & Document;
