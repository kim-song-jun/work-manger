export type CompanySettings = {
  name: string;
  code: string;
  fiscal_year_start: string;
  default_locale: string;
  timezone: string;
  brand_color: string;
  logo_url: string;
  compliance_block_when_over: boolean;
  leave_promotion_enabled: boolean;
};

export type CompanySettingsPatch = Partial<
  Pick<
    CompanySettings,
    | "default_locale"
    | "timezone"
    | "brand_color"
    | "logo_url"
    | "compliance_block_when_over"
    | "leave_promotion_enabled"
  >
>;
