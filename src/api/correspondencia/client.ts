import ApiClient from '../client';

class CorrespondenciaClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/correspondencia');
  }
}


const correspondenciaClient = new CorrespondenciaClient();
export default correspondenciaClient;
