import { prisma } from "@/lib/prisma";

interface TableInfo {
  name: string;
  recordCount: number;
}

interface PingResponse {
  success: boolean;
  message: string;
  database?: {
    name: string;
    tables: TableInfo[];
  };
  error?: string;
}

async function checkDatabaseConnection(): Promise<PingResponse> {
  try {
    // Teste de conexão simples
    await prisma.$queryRaw`SELECT 1`;

    // Buscar informações das tabelas
    const tables = await prisma.$queryRaw<
      Array<{ table_name: string }>
    >`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`;

    // Contar registros em cada tabela
    const tableInfo: TableInfo[] = [];

    for (const table of tables) {
      const tableName = table.table_name;
      // Usar template string dinâmica para construir a query
      const countResult = await prisma.$queryRawUnsafe<
        Array<{ count: bigint }>
      >(`SELECT COUNT(*) as count FROM "${tableName}"`);

      tableInfo.push({
        name: tableName,
        recordCount: Number(countResult[0]?.count || 0),
      });
    }

    return {
      success: true,
      message: "Conexão com banco de dados estabelecida com sucesso",
      database: {
        name: "twagendanew2",
        tables: tableInfo,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";

    return {
      success: false,
      message: "Falha ao conectar com o banco de dados",
      error: errorMessage,
    };
  }
}

export async function ping(): Promise<PingResponse> {
  return await checkDatabaseConnection();
}
