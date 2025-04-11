// Boleto.ts
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Lote } from "./Lote";

@Entity()
export class Boleto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome_sacado: string;

  @Column("decimal")
  valor: number;

  @Column()
  linha_digitavel: string;

  @Column()
  ativo: boolean;

  @CreateDateColumn()
  criado_em: Date;

  @ManyToOne(() => Lote, (lote) => lote.boletos)
  @JoinColumn({ name: "id_lote" })
  lote: Lote;
}
