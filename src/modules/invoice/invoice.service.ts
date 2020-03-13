import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConnectionManager, Repository } from 'typeorm';
import { Invoice } from './entity/invoice.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceResponse } from './entity/invoice.response';
import { InvoiceRequest } from './entity/invoice.request';
import { plainToClass } from 'class-transformer';
import { CodeEnum } from '../../shared/model/code.enum';
import { InvoiceStatus } from '../invoice-status/entity/invoice-status.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceStatus)
    private readonly invoiceStatusRepository: Repository<InvoiceStatus>) {
  }

  async getInvoices(): Promise<InvoiceResponse[]> {
    let result;
    const invoices = await this.invoiceRepository.find({ relations: ['status'] });
    result = plainToClass(InvoiceResponse, invoices);
    return result;
  }

  async getInvoice(id: string): Promise<any> {
    let result;
    const invoice = await this.invoiceRepository.findOne({ where: { uuid: id }, relations: ['status'] });
    if (!invoice) {
      throw new HttpException('Invoice with given id Not found', HttpStatus.NOT_FOUND);
    }
    result = plainToClass(InvoiceResponse, invoice);
    return result;
  }

  async create(invoiceRequest: InvoiceRequest): Promise<InvoiceResponse> {
    let result;
    const st = await this.invoiceStatusRepository.findOne({ where: { code: CodeEnum.NEW } });
    const invoice = this.invoiceRepository.create(invoiceRequest);
    invoice.status = st;
    await this.invoiceRepository.save(invoice);
    result = plainToClass(InvoiceResponse, invoice);
    return result;
  }

  async update(id: string, invoiceRequest: Partial<InvoiceRequest>): Promise<any> {
    const invoice = this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return await this.invoiceRepository.save({ ...invoice, ...invoiceRequest });
  }

  async delete(id: string): Promise<Invoice> {
    const book = this.invoiceRepository.findOne({ where: { id } });
    if (!book) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    await this.invoiceRepository.delete({ id });
    return book;
  }
}
