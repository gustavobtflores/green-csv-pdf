import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Lote } from "./Lote";

@Entity()
export class LoteMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  id_externo: string;

  @ManyToOne(() => Lote, { eager: true, nullable: false })
  @JoinColumn({ name: "lote_id" })
  lote: Lote;
}
