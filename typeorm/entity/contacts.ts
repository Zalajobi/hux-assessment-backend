import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '@typeorm/entity/user';
import { ContactLabel } from '@typeorm/entity/enums';
import { createContactRequestSchema } from '@schemas/contactsSchemas';
import { z } from 'zod';

@Entity()
export class Contacts {
  constructor(data: z.infer<typeof createContactRequestSchema>) {
    this.first_name = data?.first_name;
    this.last_name = data?.last_name;
    this.phone = data?.phone;
    this.userId = data?.userId ?? '';
    this.label = <ContactLabel>data?.label ?? ContactLabel.MOBILE;
    this.email = data?.email ?? '';
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
  })
  userId: string;

  @Column({
    nullable: true,
  })
  email: string;

  @Column({
    nullable: false,
  })
  first_name: string;

  @Column({
    nullable: false,
  })
  last_name: string;

  @Column({
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'enum',
    enum: ContactLabel,
    nullable: true,
    default: ContactLabel.MOBILE,
  })
  label: ContactLabel;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne((type) => User, (user) => user.contacts)
  @JoinColumn()
  user: User;
}
