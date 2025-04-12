import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Boleto } from "./Boleto";

@Entity()
export class Lote {
  @PrimaryColumn()
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
