import PubSub from 'pubsub-js';

export default class TratadorErros{

    publicaErros(resposta){
        let errors = resposta.errors;
        errors.forEach(erro => {
            console.log(erro);
            PubSub.publish("erro-validacao",erro);
        })
    }
}