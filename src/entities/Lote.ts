// Lote.ts
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Boleto } from "./Boleto";

@Entity()
export class Lote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  ativo: boolean;

  @CreateDateColumn()
  criado_em: Date;

  @OneToMany(() => Boleto, (boleto) => boleto.lote)
  boletos: Boleto[];
}
