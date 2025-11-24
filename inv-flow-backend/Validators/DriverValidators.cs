using FluentValidation;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Validators;

public class CreateDriverDtoValidator : AbstractValidator<CreateDriverDto>
{
    public CreateDriverDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Driver name is required")
            .MaximumLength(200).WithMessage("Driver name must not exceed 200 characters");

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("Phone number must not exceed 50 characters");
    }
}

public class UpdateDriverDtoValidator : AbstractValidator<UpdateDriverDto>
{
    public UpdateDriverDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Driver name is required")
            .MaximumLength(200).WithMessage("Driver name must not exceed 200 characters");

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("Phone number must not exceed 50 characters");
    }
}

