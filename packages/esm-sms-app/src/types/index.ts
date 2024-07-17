export interface ProviderConfiguration {
  name: string;
  maxRetries: number;
  excludeLastFooter: boolean;
  splitHeader: string;
  splitFooter: string;
  templateName: string;
  props: Array<Prop>;
  automaticResponseScript: string;
}

export type Prop = {
  name: string;
  value: string;
};

export interface ProviderConfigurationsResponse {
  defaultConfigName: string;
  configs: Array<ProviderConfiguration>;
  defaultConfig: ProviderConfiguration;
  empty: boolean;
}

export interface ConfigurationTableHeader {
  key: string;
  header: string;
  isSortable: boolean;
  sortFunc: (valueA: any, valueB: any) => any;
}

export interface ConfigurationTableDataRow extends ProviderConfiguration {
  configuration: string;
  id: string;
}

export interface SMSLog {
  id: number;
  errorMessage: string;
  providerStatus: string;
  openMrsId: string;
  providerId: string;
  deliveryStatus: string;
  messageContent: string;
  timestamp: string;
  config: string;
  smsDirection: string;
  phoneNumber: string;
  modificationDate: string;
  creationDate: string;
  modifiedBy: string;
  creator: string;
}

export interface SMSLogsResponse {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  rows: Array<SMSLog>;
}

export interface ServiceConfigTemplate {
  name: string;
  configurables: string[];
}

export interface ServiceConfigTemplates {
  [key: string]: ServiceConfigTemplate;
}
