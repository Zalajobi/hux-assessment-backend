import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Contacts} from "@typeorm/entity/contacts";
import {createUserRequestSchema} from "@schemas/usersSchemas";
import {z} from "zod";

@Entity()
export class User {
  constructor(userData: z.infer<typeof createUserRequestSchema>) {
    this.name = userData?.name;
    this.email = userData?.email;
    this.password = userData?.password;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    nullable: false,
  })
  password: string;

  @Column({
    nullable: false,
  })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany((type) => Contacts, (contact) => contact.user, {
    onDelete: "CASCADE"
  })
  contacts: Contacts;
}
