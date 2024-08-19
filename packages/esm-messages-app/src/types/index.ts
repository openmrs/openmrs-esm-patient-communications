export interface MessagesTemplateResponse {
  pageIndex: number;
  pageSize: number;
  contentSize: number;
  totalRecords: number;
  content: Array<MessagesTemplate>;
}

export interface MessagesTemplate {
  id: number;
  name: string;
  serviceQuery: string;
  serviceQueryType: string;
  calendarServiceQuery: string;
  shouldUseOptimizedQuery: boolean;
  templateFields: Array<TemplateField>;
  createdAt: string;
  uuid: string;
}

export interface TemplateField {
  id: number;
  name: string;
  mandatory: boolean;
  defaultValue: string;
  defaultValues: [
    {
      id: number;
      relationshipTypeId: number;
      direction: string;
      templateFieldId: number;
      defaultValue: string;
    },
  ];
  possibleValues: Array<string>;
  type: string;
  uuid: string;
}
