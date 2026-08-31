// Contrato de saída da API: de propósito não tem "password" nem
// "hashed_password" aqui. Isso é o que garante, em nível de tipo, que
// nenhuma camada acima consiga devolver esses campos por engano.
export type UserResponse = {
  id: number;
  email: string;
  full_name: string;
  role: "researcher" | "admin";
  is_active: boolean;
  created_at: string;
};
