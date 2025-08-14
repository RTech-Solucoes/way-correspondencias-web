import ApiClient from "../client";

class EmailClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/email');
  }

}

export const emailClient = new EmailClient();
export default emailClient;