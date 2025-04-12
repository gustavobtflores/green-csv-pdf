import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Lote } from "./Lote";

@Entity()
export class LoteMapping {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  id_externo: string;

  @Column({ unique: true, type: "int", nullable: true })
  pdf_order: number;

  @ManyToOne(() => Lote, { eager: true, nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "lote_id" })
  lote: Lote;
}
