import Joi from "joi";
import {
  Addresses,
  CreateTransaction,
  AddressLocationInfo,
  IsValidInterface,
  FooBar,
} from "../../types";

export const ShippingAddressSchema = Joi.object<AddressLocationInfo>({
  line1: Joi.string(),
  line2: Joi.string(),
  city: Joi.string(),
  postCode: Joi.string(),
  latitude: Joi.number(),
  longitude: Joi.number(),
})
  .with("line1", ["city", "postCode"])
  .and("latitude", "longitude")
  .xor("line1", "latitude")
  .required();

export const CreateTransactionSchema = Joi.object<CreateTransaction>({
  id: Joi.number().required(),
  code: Joi.string().min(2).max(6).required(),
  dateTimeCreated: Joi.date().iso().max("now").required().label("createdAt"),
  dateTimeCompleted: Joi.date().iso().min(Joi.ref("dateTimeCreated")),
  addresses: Joi.array()
    .items(
      Joi.object<Addresses>({
        shipFrom: ShippingAddressSchema,
        shipTo: ShippingAddressSchema,
      })
    )
    .min(1),
  stringOrNumberOrObj: Joi.alternatives(
    Joi.string(),
    Joi.number(),
    Joi.object<FooBar>({
      foo: Joi.string().required(),
      bar: Joi.number().required(),
    })
  ).required(),
});

const validateCreateTransaction: IsValidInterface<CreateTransaction> = async (
  data
) => {
  try {
    await CreateTransactionSchema.validateAsync(data, { abortEarly: false });
    return true;
  } catch (e) {
    console.log("joi validation error", JSON.stringify(e, null, 2));
    return false;
  }
};

export default validateCreateTransaction;
