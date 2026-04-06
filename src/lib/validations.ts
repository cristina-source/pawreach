import { z } from "zod"

export const contactoSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email(),
  telefone: z.string().optional(),
  tipoNegocio: z.enum([
    "PET_SHOP",
    "GROOMING",
    "CLINICA_VET",
    "HOTEL_PETS",
    "ADESTRADOR",
    "PET_SITTER",
    "LOJA_ONLINE",
    "OUTROS",
  ]),
  cidade: z.string().optional(),
  regiao: z.string().optional(),
  estadoLead: z.enum(["FRIO", "MORNO", "QUENTE", "CLIENTE"]).optional(),
  fonteContato: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notas: z.string().optional(),
  consentimento: z.boolean().optional(),
})

export const campanhaSchema = z.object({
  nome: z.string().min(2).max(200),
  assunto: z.string().min(2).max(200),
  preheader: z.string().optional(),
  conteudoHtml: z.string().min(10),
  conteudoText: z.string().optional(),
  segmentId: z.string().optional(),
  agendadoPara: z.string().datetime().optional(),
  testAbEnabled: z.boolean().optional(),
  assuntoB: z.string().optional(),
})

export const segmentoSchema = z.object({
  nome: z.string().min(2).max(100),
  descricao: z.string().optional(),
  tipo: z.enum(["ESTATICO", "DINAMICO"]).optional(),
  filtros: z.record(z.unknown()).optional(),
})

export const iaGerarSchema = z.object({
  tipoEmail: z.string(),
  tipoNegocio: z.string(),
  tom: z.string(),
  objetivo: z.string(),
  contextoAdicional: z.string().optional(),
})

export const automacaoSchema = z.object({
  nome: z.string().min(2).max(200),
  descricao: z.string().optional(),
  segmentId: z.string().optional(),
  nos: z.array(z.unknown()),
})
