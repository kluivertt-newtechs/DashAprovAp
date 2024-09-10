import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import {
  PoDialogService,
  PoModule,
  PoNotificationService,
  PoPageModule,
  PoTableColumn,
} from '@po-ui/ng-components';
import { HomeService } from '../home.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PoModule, PoPageModule, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  private intervalId: any;
  private subscription: Subscription = new Subscription();

  constructor(
    private homeService: HomeService,
    private poDialog: PoDialogService,
    private poNotification: PoNotificationService
  ) {}

  filtros: any = {
    empresa: '',
    estabelecimento: '',
    dataTransacao: new Date(),
    dataBaixa: '',
    formaPagto: '',
    portador: '',
  };

  columnsDash: Array<PoTableColumn> = [
    { property: 'empresa', label: 'Empresa', type: 'link' },
    { property: 'totalEmpresa', label: 'TOTAL Empresa' },
  ];

  columnsDetalhe: Array<PoTableColumn> = [
    { property: 'estabelecimento', label: 'Estabelec.' },
    { property: 'titulo', label: 'Num.Titulo' },
    { property: 'parcela', label: 'Parcela' },
    { property: 'especie', label: 'Espécie' },
    { property: 'serie', label: 'Serie' },
    { property: 'portador', label: 'Portador' },
    { property: 'dataVencimento', label: 'Data Vencim.', type: 'date' },
    { property: 'dataPagamento', label: 'Data Pagto', type: 'date' },
    { property: 'valorPagamento', label: 'R$ Pagto', type: 'currency' },
    { property: 'valorAbatimento', label: 'R$ Abatimento', type: 'currency' },
    { property: 'valorDesconto', label: 'R$ Desconto', type: 'currency' },
    { property: 'valorJuros', label: 'R$ Juros', type: 'currency' },
    { property: 'valorMulta', label: 'R$ Multa' },

    { property: 'formaPagamento', label: 'Forma Pagto' },
    { property: 'fornecedor', label: 'Fornecedor' },
    { property: 'nomeAbreviado', label: 'Nome' },
  ];

  itensDash: Array<any> = [];

  itensDetalhe: [] = [];

  regsRelatorio: any = [];

  hasMore$!: boolean;
  escondeTimer = true;
  loadingTable: boolean = false;

  ngOnInit(): void {
    // this.atualizaDados();
    // this.intervalId = setInterval(() => {
    //   this.atualizaDados();
    // }, 300000); // 300000 ms = 5 minutos
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subscription.unsubscribe();
  }

  atualizaDados() {
    if (
      this.filtros.dataTransacao === '' ||
      this.filtros.dataTransacao === undefined
    ) {
      this.poNotification.warning('Informe uma data de transação válida');
      return;
    }
    this.escondeTimer = false;
    this.loadingTable = true;
    this.homeService.getDados(this.filtros).subscribe({
      //this.homeService.getDados2().subscribe({ //USAR PARA TESTE LOCAL
      next: (result) => {
        this.escondeTimer = true;
        this.itensDash = result.items;
        this.hasMore$ = result.hasNext;
        this.loadingTable = false;

        // Verificar se há itens no resultado
        if (this.itensDash.length > 0) {
          // Gerar as colunas dinamicamente com base nas chaves do JSON
          const keys = Object.keys(this.itensDash[0]);
          this.columnsDash = keys
            .filter(
              (key) =>
                key !== 'empresa' &&
                key !== 'totalEmpresa' &&
                key !== 'chaveDetalhe'
            )
            .map((key) => ({
              property: key,
              label: key.charAt(0).toUpperCase() + key.slice(1),
              type: 'currency',
            }));

          // Adicionar as colunas fixas "empresa" e "totalEmpresa" no início
          this.columnsDash.unshift({ property: 'empresa', label: 'Empresa' });
          // Adicionar as colunas fixas "empresa" e "totalEmpresa" no final
          this.columnsDash.push({
            property: 'totalEmpresa',
            label: 'TOTAL Empresa',
            type: 'currency',
          });
        }
      },
      error: (erro) => {
        this.loadingTable = false;
        this.poNotification.error(
          'Não foi possível buscar as informações no momento. Por favor, tente novamente mais tarde.'
        );
      },
    });
  }

  MostraTotalEmpresa(nomeEmpresa: string) {
    if (nomeEmpresa != 'Total Geral') {
      console.log(nomeEmpresa);
    }
  }

  MostraDetalheEmpresa(args: any) {
    this.escondeTimer = false;
    this.homeService.getDetalhe(args.chaveDetalhe).subscribe({
      //  this.homeService.getdetalhe().subscribe({
      next: (result) => {
        this.escondeTimer = true;
        this.itensDetalhe = result.items;
        this.hasMore$ = result.hasNext;
      },
      error: (erro) => {
        this.escondeTimer = true;
        console.log(erro);
      },
    });
  }

  habilitaDetalhe(row: any, index: number) {
    return row.empresa !== 'Total Geral';
  }

  geraRelatorio(): void {
    this.poDialog.confirm({
      title: 'Reprocessamento',
      message: `Confirma a geração do relatorio?`,
      confirm: () => this.ImprimeDados(),
      cancel: () => {},
    });
  }
  ImprimeDados() {
    this.escondeTimer = false;
    this.homeService.getRelat(this.filtros).subscribe((resposta) => {
      this.regsRelatorio = resposta;

      if (this.regsRelatorio.hasError == true) {
        this.escondeTimer = true;
        this.poNotification.error(`${resposta.mensagem}`);
      } else {
        const nameFile = resposta.nomeArquivo;
        const file = new Blob([window.atob(resposta.arquivo)], {
          type: resposta.type,
        });
        this.escondeTimer = true;
        this.filtros.pageSize = 100;
        const blob = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = blob;
        link.download = nameFile;
        link.click();
        window.URL.revokeObjectURL(blob);
        link.remove;
      }
    });
  }
}
