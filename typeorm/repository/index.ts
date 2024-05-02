import {AppDataSource} from "../../data-source";
import {User} from "@typeorm/entity/user";
import {Contacts} from "@typeorm/entity/contacts";

export const userRepo = () => {
  return AppDataSource.getRepository(User);
};

export const contactRepo = () => {
  return AppDataSource.getRepository(Contacts);
}
