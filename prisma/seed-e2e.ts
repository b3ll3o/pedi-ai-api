/**
 * Seed script para criar admin user e perfil ADMIN
 * Executar via: cd /home/leo/pedi-ai/pedi-ai-api && npx ts-node prisma/seed-e2e.ts
 */

import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('🔧 Seed: Iniciando criação do admin user...');

  const prisma = new PrismaService();

  try {
    // Criar perfil ADMIN se não existir
    let perfilAdmin = await prisma.perfil.findFirst({
      where: { nome: 'ADMIN', deletedAt: null },
    });

    if (!perfilAdmin) {
      console.log('📝 Criando perfil ADMIN...');
      perfilAdmin = await prisma.perfil.create({
        data: {
          nome: 'ADMIN',
          descricao: 'Perfil Administrador para testes E2E',
        },
      });
      console.log(`✅ Perfil ADMIN criado com ID: ${perfilAdmin.id}`);
    } else {
      console.log(`✅ Perfil ADMIN já existe com ID: ${perfilAdmin.id}`);
    }

    // Criar perfil USUARIO (default para self-register) se não existir
    let perfilUsuario = await prisma.perfil.findFirst({
      where: { nome: 'USUARIO', deletedAt: null },
    });
    if (!perfilUsuario) {
      console.log('📝 Criando perfil USUARIO...');
      perfilUsuario = await prisma.perfil.create({
        data: {
          nome: 'USUARIO',
          descricao: 'Perfil de usuário comum (default para self-register)',
        },
      });
      console.log(`✅ Perfil USUARIO criado com ID: ${perfilUsuario.id}`);
    } else {
      console.log(`✅ Perfil USUARIO já existe com ID: ${perfilUsuario.id}`);
    }

    // Criar usuário admin se não existir
    const adminEmail = 'admin@pediai.com';
    const adminSenha = 'PediAi@01';
    const senhaHash = await bcrypt.hash(adminSenha, SALT_ROUNDS);

    let usuarioAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!usuarioAdmin) {
      console.log('📝 Criando usuário admin...');
      usuarioAdmin = await prisma.user.create({
        data: {
          nome: 'Pedi Ai Admin',
          email: adminEmail,
          senha: senhaHash,
          perfilId: perfilAdmin.id,
        },
      });
      console.log(`✅ Usuário admin criado com ID: ${usuarioAdmin.id}`);
    } else {
      console.log(`✅ Usuário admin já existe com ID: ${usuarioAdmin.id}`);
      // Atualiza para ter perfil ADMIN
      if (usuarioAdmin.perfilId !== perfilAdmin.id) {
        await prisma.user.update({
          where: { id: usuarioAdmin.id },
          data: { perfilId: perfilAdmin.id },
        });
        console.log('✅ Perfil ADMIN associado ao usuário admin');
      }
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminSenha}`);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));