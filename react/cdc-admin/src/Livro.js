import React, {Component} from 'react';
import $ from 'jquery';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';
import InputCustomizado from './componentes/InputCustomizado';
import BotaoSubmitCustomizado from './componentes/BotaoSubmitCustomizado'


class FormularioLivro extends Component {

    constructor() {
        super();
        this.state = {titulo: '', preco: '', autorId: ''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    enviaForm(evento) {
        evento.preventDefault();
        console.log("dados sendo enviados");
        $.ajax({
            url: 'http://localhost:8080/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: resposta => {
                console.log('enviado com sucesso');
                // this.props.callbackAtualizaListagem(resposta);
                let novaListagem = resposta;
                this._limparState();
                PubSub.publish('atualiza-lista-livros', novaListagem);
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
        this.setState({titulo: ""});
        this.setState({preco: ""});
        this.setState({autorId: ""});
    }

    setTitulo(event) {
        this.setState({titulo: event.target.value});
    }

    setPreco(event) {
        this.setState({preco: event.target.value});
    }

    setAutorId(event) {
        this.setState({autorId: event.target.value});
    }

    render() {
        let autores = this.props.autores.map(autor => {
            return (
                <option key={autor.id} value={autor.id}>{autor.nome}</option>
            );
        });
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo}
                                      label="Titulo:"/>
                    <InputCustomizado id="preco" type="decimal" name="preco" value={this.state.preco}
                                      onChange={this.setPreco} label="Preço:"/>
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor:</label>
                        <select value={this.state.autorId} id="autorId" name="autorId" onChange={this.setAutorId}>
                            <option value="">Selecione</option>
                            {autores}
                        </select>
                        <span className="error">{this.state.msgErro}</span>
                    </div>
                    <BotaoSubmitCustomizado label="Enviar"/>
                </form>
            </div>
        );
    }
}

class TabelaLivros extends Component {

    render() {
        let livros = this.props.lista.map(livro => {
            return (
                <tr key={livro.id}>
                    <td>{livro.titulo}</td>
                    <td>{livro.autor.nome}</td>
                    <td>{livro.preco}</td>
                </tr>
            );
        });
        return (
            <div>
                <table className="pure-table">
                    <thead>
                    <tr>
                        <th>Titulo</th>
                        <th>Autor</th>
                        <th>Preço</th>
                    </tr>
                    </thead>
                    <tbody>
                        {livros}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class LivroBox extends Component {

    constructor() {
        super();
        this.state = {lista:[], autores:[]};
    }

    componentDidMount() {
        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: 'json',
            success: resposta => {
                this.setState({lista: resposta});
            }
        });
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: 'json',
            success: resposta => {
                this.setState({autores:resposta});
            }
        });
        PubSub.subscribe('atualiza-lista-livros', (topico, novaLista) => {
            console.log(topico);
            this.setState({lista: novaLista});
        })
    }

    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores}/>
                    <TabelaLivros lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}