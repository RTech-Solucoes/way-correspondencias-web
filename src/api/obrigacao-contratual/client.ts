import ApiClient from "../client";

export class ObrigacaoContratualClient {
    private client: ApiClient;

    constructor() {
        this.client = new ApiClient('/obrigacao-contratual');
    }

    
}