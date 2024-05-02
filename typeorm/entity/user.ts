import {
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Contacts} from "@typeorm/entity/contacts";

@Entity()
export class User {
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
