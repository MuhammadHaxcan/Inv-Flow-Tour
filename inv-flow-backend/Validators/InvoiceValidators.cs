using FluentValidation;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Validators;

public class CreateInvoiceDtoValidator : AbstractValidator<CreateInvoiceDto>
{
    public CreateInvoiceDtoValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Invoice date is required");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Customer is required");

        RuleFor(x => x.Persons)
            .GreaterThan(0).WithMessage("Number of persons must be greater than 0");

        RuleFor(x => x.Services)
            .NotEmpty().WithMessage("At least one service is required");

        RuleForEach(x => x.Services)
            .SetValidator(new CreateInvoiceServiceDtoValidator());

        RuleForEach(x => x.Expenses)
            .SetValidator(new CreateInvoiceExpenseDtoValidator());

        RuleForEach(x => x.Payments)
            .SetValidator(new CreatePaymentDtoValidator());
    }
}

public class CreateInvoiceServiceDtoValidator : AbstractValidator<CreateInvoiceServiceDto>
{
    public CreateInvoiceServiceDtoValidator()
    {
        RuleFor(x => x.ServiceId)
            .GreaterThan(0).WithMessage("Service is required");

        RuleFor(x => x.Rate)
            .GreaterThan(0).WithMessage("Service rate must be greater than 0");
    }
}

public class CreateInvoiceExpenseDtoValidator : AbstractValidator<CreateInvoiceExpenseDto>
{
    public CreateInvoiceExpenseDtoValidator()
    {
        RuleFor(x => x.ExpenseTypeId)
            .GreaterThan(0).WithMessage("Expense type is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Expense amount must be greater than 0");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Expense date is required");
    }
}

public class CreatePaymentDtoValidator : AbstractValidator<CreatePaymentDto>
{
    public CreatePaymentDtoValidator()
    {
        RuleFor(x => x.AccountId)
            .GreaterThan(0).WithMessage("Account is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than 0");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Payment date is required");
    }
}

public class AddPaymentDtoValidator : AbstractValidator<AddPaymentDto>
{
    public AddPaymentDtoValidator()
    {
        RuleFor(x => x.AccountId)
            .GreaterThan(0).WithMessage("Account is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than 0");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Payment date is required");
    }
}

public class AddExpenseDtoValidator : AbstractValidator<AddExpenseDto>
{
    public AddExpenseDtoValidator()
    {
        RuleFor(x => x.ExpenseTypeId)
            .GreaterThan(0).WithMessage("Expense type is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Expense amount must be greater than 0");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Expense date is required");
    }
}

public class AddInvoiceServiceDtoValidator : AbstractValidator<AddInvoiceServiceDto>
{
    public AddInvoiceServiceDtoValidator()
    {
        RuleFor(x => x.ServiceId)
            .GreaterThan(0).WithMessage("Service is required");

        RuleFor(x => x.Rate)
            .GreaterThan(0).WithMessage("Service rate must be greater than 0");
    }
}

public class UpdateExpenseDtoValidator : AbstractValidator<UpdateExpenseDto>
{
    public UpdateExpenseDtoValidator()
    {
        RuleFor(x => x.ExpenseTypeId)
            .GreaterThan(0).WithMessage("Expense type is required");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Expense amount must be greater than 0");

        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Expense date is required");
    }
}

