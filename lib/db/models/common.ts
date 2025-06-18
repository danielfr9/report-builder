export interface Sprint {
  from: string;
  to: string;
}

export interface Block {
  id: string;
  reportId?: number;
  name: string;
}

export interface Observation {
  id?: string;
  reportId?: number;
  name?: string;
}
