import ApiClient from "../client";

class ResponsaveisClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/responsaveis');
  }

}

export const responsaveisClient = new ResponsaveisClient();
export default responsaveisClient;