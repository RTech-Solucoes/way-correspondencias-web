import ApiClient from "../client";

class TemasClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/temas');
  }

}

export const temasClient = new TemasClient();
export default temasClient;