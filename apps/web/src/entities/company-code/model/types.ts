/** Join codes that admins issue to invite employees. */
export type CompanyCode = {
  id: string;
  code: string;
  expires_at?: string | null;
  max_uses?: number | null;
  used_count?: number;
  created_at?: string;
  revoked?: boolean;
};
