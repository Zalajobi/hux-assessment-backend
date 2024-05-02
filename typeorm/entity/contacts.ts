import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from "@typeorm/entity/user";
import {ContactLabel} from "@typeorm/entity/enums";

@Entity()
export class Contacts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false
  })
  userId: string;

  @Column({
    nullable: true
  })
  email: string;

  @Column({
    nullable: false
  })
  first_name: string;

  @Column({
    nullable: false
  })
  last_name: string;

  @Column({
    nullable: false
  })
  phone: string;

  @Column({
    type: 'enum',
    enum: ContactLabel,
    nullable: true,
    default: ContactLabel.MOBILE
  })
  label: ContactLabel

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne((type) => User, (user) => user.contacts)
  @JoinColumn()
  user: User;
}
