import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from "@typeorm/entity/user";

@Entity()
export class Contacts {
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
  @ManyToOne((type) => User, (user) => user.contacts)
  @JoinColumn()
  user: User;
}
