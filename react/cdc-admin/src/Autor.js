import React, {Component} from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado'

class FormularioAutor extends Component {

    constructor() {
        super();
        this.state = {nome: '', email: '', senha: ''};
        this.enviaForm = this.enviaForm.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        console.log("dados sendo enviados");
        $.ajax({
            url: 'http://localhost:8080/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({nome: this.state.nome, email: this.state.email, senha: this.state.senha}),
            success: resposta => {
                console.log('enviado com sucesso');
                // this.props.callbackAtualizaListagem(resposta);
                let novaListagem = resposta;
                this._limparState();
                PubSub.publish('atualiza-lista-autores', novaListagem);
            },
            error: resposta => {
                console.log("ocorreu um erro");
                if (resposta.status === 400) {
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
                console.log(resposta);
            },
            beforeSend: () => {
                PubSub.publish("limpa-erros", {});
            }
        })
    }

    _limparState() {
        this.setState({nome: ""});
        this.setState({email: ""});
        this.setState({senha: ""});
    }

    salvarAlteracao(nomeInput,evento){
        this.setState({[nomeInput]:evento.target.value});
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.salvarAlteracao.bind(this, 'nome')}
                                      label="Nome"/>
                    <InputCustomizado id="email" type="email" name="email" value={this.state.email}
                                      onChange={this.salvarAlteracao.bind(this,'email')} label="Email"/>
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha}
                                      onChange={this.salvarAlteracao.bind(this,'senha')} label="Senha"/>

                    <BotaoSubmitCustomizado label="Gravar"/>
                </form>
            </div>
        );
    }
}

class TabelaAutores extends Component {

    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Nome</th>
                        <th>email</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(autor => {
                            return (
                                <tr key={autor.id}>
                                    <td>{autor.nome}</td>
                                    <td>{autor.email}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class AutorBox extends Component {

    constructor() {
        super();
        this.state = {lista: []};
    }

    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: resposta => {
                this.setState({lista: resposta});
            }
        });
        PubSub.subscribe('atualiza-lista-autores', (topico, novaLista) => {
            console.log(topico);
            this.setState({lista: novaLista});
        })
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor/>
                    <TabelaAutores lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}