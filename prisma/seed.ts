import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding PawReach demo data...")

  // AllowedEmail
  await prisma.allowedEmail.upsert({
    where: { email: "demo@pawreach.pt" },
    update: {},
    create: { email: "demo@pawreach.pt", role: "ADMIN" },
  })

  // User
  const user = await prisma.user.upsert({
    where: { email: "demo@pawreach.pt" },
    update: {},
    create: {
      name: "Demo PawReach",
      email: "demo@pawreach.pt",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  // Subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      plan: "FREE",
      status: "FREE",
    },
  })

  // 5 Contacts
  const contacts = await Promise.all([
    prisma.contact.upsert({
      where: { userId_email: { userId: user.id, email: "mariapet@gmail.com" } },
      update: {},
      create: {
        userId: user.id,
        nome: "Maria Silva",
        email: "mariapet@gmail.com",
        telefone: "912 345 678",
        tipoNegocio: "PET_SHOP",
        cidade: "Lisboa",
        regiao: "Lisboa",
        estadoLead: "QUENTE",
        fonteContato: "Instagram",
        tags: ["pet-shop", "lisboa"],
        consentimento: true,
      },
    }),
    prisma.contact.upsert({
      where: { userId_email: { userId: user.id, email: "joao.grooming@outlook.com" } },
      update: {},
      create: {
        userId: user.id,
        nome: "João Costa",
        email: "joao.grooming@outlook.com",
        telefone: "965 432 100",
        tipoNegocio: "GROOMING",
        cidade: "Porto",
        regiao: "Norte",
        estadoLead: "MORNO",
        fonteContato: "Google Ads",
        tags: ["grooming", "porto"],
        consentimento: true,
      },
    }),
    prisma.contact.upsert({
      where: { userId_email: { userId: user.id, email: "dra.ana@clinicaverde.pt" } },
      update: {},
      create: {
        userId: user.id,
        nome: "Dra. Ana Ferreira",
        email: "dra.ana@clinicaverde.pt",
        telefone: "220 111 222",
        tipoNegocio: "CLINICA_VET",
        cidade: "Braga",
        regiao: "Norte",
        estadoLead: "FRIO",
        fonteContato: "LinkedIn",
        tags: ["vet", "braga"],
        consentimento: false,
      },
    }),
    prisma.contact.upsert({
      where: { userId_email: { userId: user.id, email: "hotelpatinhas@gmail.com" } },
      update: {},
      create: {
        userId: user.id,
        nome: "Carlos Mendes",
        email: "hotelpatinhas@gmail.com",
        telefone: "936 777 888",
        tipoNegocio: "HOTEL_PETS",
        cidade: "Cascais",
        regiao: "Lisboa",
        estadoLead: "CLIENTE",
        fonteContato: "Referência",
        tags: ["hotel", "cascais"],
        consentimento: true,
        notas: "Já usa a PetBiz há 2 meses. Muito satisfeito.",
      },
    }),
    prisma.contact.upsert({
      where: { userId_email: { userId: user.id, email: "ritaloja@petworld.pt" } },
      update: {},
      create: {
        userId: user.id,
        nome: "Rita Oliveira",
        email: "ritaloja@petworld.pt",
        telefone: "916 543 210",
        tipoNegocio: "LOJA_ONLINE",
        cidade: "Setúbal",
        regiao: "Setúbal",
        estadoLead: "MORNO",
        fonteContato: "Email",
        tags: ["loja-online", "setubal"],
        consentimento: true,
      },
    }),
  ])

  // AllowedEmail adicional para demo
  await prisma.allowedEmail.upsert({
    where: { email: "cristina@exemplo.com" },
    update: {},
    create: { email: "cristina@exemplo.com", role: "ADMIN" },
  })

  // 2 Segments
  const seg1 = await prisma.segment.create({
    data: {
      userId: user.id,
      nome: "Pet Shops Lisboa",
      descricao: "Todos os pet shops da região de Lisboa",
      tipo: "DINAMICO",
      filtros: { tipoNegocio: "PET_SHOP", regiao: "Lisboa" },
    },
  })

  const seg2 = await prisma.segment.create({
    data: {
      userId: user.id,
      nome: "Leads Quentes",
      descricao: "Contactos com estadoLead QUENTE ou CLIENTE",
      tipo: "DINAMICO",
      filtros: { estadoLead: ["QUENTE", "CLIENTE"] },
    },
  })

  const seg3 = await prisma.segment.create({
    data: {
      userId: user.id,
      nome: "Groomings Portugal",
      descricao: "Todos os negócios de grooming em Portugal",
      tipo: "DINAMICO",
      filtros: { tipoNegocio: "GROOMING" },
    },
  })

  // Add contacts to segments
  await prisma.segmentContact.createMany({
    data: [
      { segmentId: seg1.id, contactId: contacts[0].id },
      { segmentId: seg2.id, contactId: contacts[0].id },
      { segmentId: seg2.id, contactId: contacts[3].id },
      { segmentId: seg3.id, contactId: contacts[1].id },
    ],
    skipDuplicates: true,
  })

  // 1 Campaign
  const campaign = await prisma.campaign.create({
    data: {
      userId: user.id,
      nome: "Campanha Lançamento PetBiz — Pet Shops",
      assunto: "O seu pet shop merece mais do que uma folha de Excel",
      preheader: "30 dias grátis, sem cartão de crédito. Setup em 5 minutos.",
      status: "RASCUNHO",
      segmentId: seg1.id,
      testAbEnabled: true,
      assuntoB: "Já imaginou ter o seu negócio 100% organizado esta semana?",
      conteudoHtml: `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PetBiz — Experimente grátis</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #F97316; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">PetBiz</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">A plataforma pensada 100% para negócios pet</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #333; line-height: 1.6;">Olá,</p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Sei que gerir um pet shop não é fácil. Entre clientes, fichas dos animais, marcações e stocks —
        parece que o dia nunca chega ao fim com tudo feito.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        A PetBiz foi criada especificamente para resolver isso. Não é mais uma ferramenta genérica —
        é uma plataforma pensada do zero para quem trabalha com animais.
      </p>
      <h2 style="color: #F97316; font-size: 20px; margin-top: 30px;">O que muda com a PetBiz:</h2>
      <ul style="color: #333; font-size: 15px; line-height: 2;">
        <li>Fichas completas de cada animal e dono num só lugar</li>
        <li>Lembretes automáticos de vacinas, consultas e tosquias</li>
        <li>Agenda organizada sem confusões nem duplas marcações</li>
        <li>Histórico completo de cada visita ao pet shop</li>
        <li>Relatórios simples do desempenho do negócio</li>
      </ul>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://petbiz.pt/experimentar"
           style="background: #F97316; color: white; padding: 16px 40px; border-radius: 8px;
                  text-decoration: none; font-size: 18px; font-weight: bold; display: inline-block;">
          Experimentar 30 dias grátis
        </a>
        <p style="color: #999; font-size: 13px; margin-top: 12px;">Sem cartão de crédito. Setup em 5 minutos.</p>
      </div>
      <p style="font-size: 15px; color: #666; line-height: 1.6;">
        Já temos centenas de negócios pet organizados com a PetBiz.
        Junte-se a eles e veja a diferença na primeira semana.
      </p>
      <p style="font-size: 15px; color: #333;">Com os melhores cumprimentos,<br><strong>Cristina Pena</strong><br>Fundadora, PetBiz</p>
    </div>
    <div style="background: #f9f9f9; padding: 20px 30px; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999; margin: 0;">
        Recebeu este email porque se registou na PetBiz ou deu o seu consentimento para receber comunicações.
        <a href="#" style="color: #F97316;">Cancelar subscrição</a>
      </p>
    </div>
  </div>
</body>
</html>`,
      conteudoText:
        "Olá, sei que gerir um pet shop não é fácil. A PetBiz foi criada para resolver isso. Experimente 30 dias grátis em petbiz.pt/experimentar",
    },
  })

  // CampaignStats
  await prisma.campaignStats.create({
    data: { campaignId: campaign.id },
  })

  // 2 Automation demos
  const auto1 = await prisma.automation.create({
    data: {
      userId: user.id,
      nome: "Sequência PetBiz — 5 emails",
      descricao: "Sequência de nutrição para leads do mercado pet",
      segmentId: seg3.id,
      status: "INATIVA",
      nos: [
        { tipo: "trigger", titulo: "Novo lead inscrito", subtitulo: "Ao adicionar ao segmento Groomings Portugal" },
        { tipo: "email", titulo: "Bem-vindo(a) à PawReach", subtitulo: "Email de apresentação" },
        { tipo: "delay", titulo: "Aguardar 2 dias", subtitulo: "2 dias" },
        { tipo: "email", titulo: "3 problemas que a PawReach resolve", subtitulo: "Email de benefícios" },
        { tipo: "delay", titulo: "Aguardar 3 dias", subtitulo: "3 dias" },
        { tipo: "email", titulo: "Caso de sucesso: Grooming Lisboa", subtitulo: "Email de prova social" },
        { tipo: "delay", titulo: "Aguardar 2 dias", subtitulo: "2 dias" },
        { tipo: "email", titulo: "30 dias grátis — sem cartão", subtitulo: "Email de oferta" },
        { tipo: "delay", titulo: "Aguardar 3 dias", subtitulo: "3 dias" },
        { tipo: "email", titulo: "Última oportunidade", subtitulo: "Email de urgência" },
      ],
    },
  })

  const auto2 = await prisma.automation.create({
    data: {
      userId: user.id,
      nome: "Reactivação de leads frios",
      descricao: "Sequência para reactivar leads sem actividade há 30+ dias",
      status: "INATIVA",
      nos: [
        { tipo: "trigger", titulo: "Lead inativo há 30 dias", subtitulo: "Sem abertura de email" },
        { tipo: "email", titulo: "Ainda está aí?", subtitulo: "Email de reactivação" },
        { tipo: "delay", titulo: "Aguardar 5 dias", subtitulo: "5 dias" },
        { tipo: "condicao", titulo: "Abriu o email?", subtitulo: "Verificar abertura" },
        { tipo: "email", titulo: "O que mudou na PawReach", subtitulo: "Email de novidades" },
        { tipo: "delay", titulo: "Aguardar 7 dias", subtitulo: "7 dias" },
        { tipo: "email", titulo: "Deixamos-te partir?", subtitulo: "Email final" },
      ],
    },
  })

  // Enroll demo contact in auto1
  await prisma.automationEnrollment.upsert({
    where: { automationId_contactId: { automationId: auto1.id, contactId: contacts[1].id } },
    update: {},
    create: {
      automationId: auto1.id,
      contactId: contacts[1].id,
      noAtual: "email-1",
      status: "ATIVA",
    },
  })

  // 1 AiTemplate
  await prisma.aiTemplate.create({
    data: {
      userId: user.id,
      nome: "Email de Boas-vindas — Pet Shop",
      tipo: "boas-vindas",
      tom: "próximo e empático",
      objetivo: "Apresentar a PetBiz e convidar a experimentar grátis",
      assunto: "Bem-vindo(a) à PetBiz — o seu negócio pet vai mudar para sempre",
      preheader: "Tudo pronto para começar. 3 passos simples.",
      corpo: `<p>Olá,</p>
<p>É com muito gosto que te damos as boas-vindas à PetBiz!</p>
<p>Criámos esta plataforma porque percebemos que os donos de pet shops passam demasiado tempo em tarefas administrativas — e tempo que podia estar a ser usado com os animais e clientes.</p>
<p>Para começares, segue estes 3 passos simples:</p>
<ol>
<li>Cria o perfil do teu negócio (2 minutos)</li>
<li>Importa os teus clientes (ou começa do zero)</li>
<li>Agenda a primeira consulta ou serviço</li>
</ol>
<p>Qualquer dúvida, estou aqui.</p>
<p>Abraço,<br>Cristina</p>`,
      cta: "Começar agora",
      ps: "P.S. Nos próximos 7 dias vais receber dicas exclusivas para tirar o máximo partido da PetBiz.",
      rating: 5,
    },
  })

  // 2 templates adicionais
  await prisma.aiTemplate.createMany({
    data: [
      {
        userId: user.id,
        nome: "Follow-up — Grooming",
        tipo: "Follow-up",
        tom: "Próximo e empático",
        objetivo: "Reactivar lead frio",
        assunto: "João, ainda conseguimos ajudá-lo?",
        preheader: "Temos uma oferta especial para si esta semana.",
        corpo: `<p>Olá João,</p>
<p>Há uns dias entrou em contacto com a PawReach e desde então não nos demos a conhecer como devia ser.</p>
<p>Percebo que gerir um negócio de grooming é muito trabalho — e analisar ferramentas novas está no fundo da lista de prioridades.</p>
<p>Por isso deixo aqui apenas uma coisa: experimente grátis durante 30 dias, sem qualquer compromisso.</p>
<p>Se não gostar, cancela em dois cliques. Mas se gostar — e acredito que vai — o seu negócio vai ganhar pelo menos 5 horas por semana.</p>
<p>Abraço,<br>Cristina</p>`,
        cta: "Experimentar 30 dias grátis",
        ps: "P.S. Já temos 3 grooming studios no Porto que usam a PawReach todos os dias.",
        rating: 4,
      },
      {
        userId: user.id,
        nome: "Cold outreach — Clínica Vet",
        tipo: "Cold outreach",
        tom: "Profissional",
        objetivo: "Gerar curiosidade",
        assunto: "Uma pergunta rápida, Dra. Ana",
        preheader: "Não é spam. Prometo.",
        corpo: `<p>Dra. Ana,</p>
<p>Contacto-a porque encontrei a Clínica Verde nas pesquisas e fiquei com uma dúvida:</p>
<p><strong>Quanto tempo passa por semana a gerir fichas de animais, marcações e follow-ups?</strong></p>
<p>A PawReach é uma plataforma criada especificamente para clínicas veterinárias e negócios pet que querem recuperar esse tempo.</p>
<p>Em média, os nossos clientes poupam 6 horas por semana. Horas que passam a usar com os pacientes.</p>
<p>Posso mostrar-lhe como em 15 minutos?</p>
<p>Com os melhores cumprimentos,<br>Cristina Pena<br>PawReach</p>`,
        cta: "Ver demonstração",
        ps: null,
        rating: 3,
      },
    ],
  })

  console.log("Seed completo!")
  console.log(`User: demo@pawreach.pt`)
  console.log(`Contacts: ${contacts.length}`)
  console.log(`Automações: 2`)
  console.log(`Templates: 3`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
