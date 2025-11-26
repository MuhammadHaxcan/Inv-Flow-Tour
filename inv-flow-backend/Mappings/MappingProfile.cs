using AutoMapper;
using inv_flow_backend.Models;
using inv_flow_backend.DTOs;

namespace inv_flow_backend.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Customer mappings
        CreateMap<Customer, CustomerDto>();
        CreateMap<CreateCustomerDto, Customer>();
        CreateMap<UpdateCustomerDto, Customer>();

        // Driver mappings
        CreateMap<Driver, DriverDto>();
        CreateMap<CreateDriverDto, Driver>();
        CreateMap<UpdateDriverDto, Driver>();

        // Service mappings
        CreateMap<Service, ServiceDto>();
        CreateMap<CreateServiceDto, Service>();
        CreateMap<UpdateServiceDto, Service>();

        // Account mappings
        CreateMap<Account, AccountDto>();
        CreateMap<CreateAccountDto, Account>();
        CreateMap<UpdateAccountDto, Account>();

        // ExpenseType mappings
        CreateMap<ExpenseType, ExpenseTypeDto>();
        CreateMap<CreateExpenseTypeDto, ExpenseType>();
        CreateMap<UpdateExpenseTypeDto, ExpenseType>();

        // Invoice mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.Customer != null ? src.Customer.Name : string.Empty))
            .ForMember(dest => dest.Driver, opt => opt.MapFrom(src => src.Driver != null ? src.Driver.Name : null))
            .ForMember(dest => dest.Services, opt => opt.MapFrom(src => src.InvoiceServices != null ? src.InvoiceServices : new List<InvoiceServiceItem>()))
            .ForMember(dest => dest.Expenses, opt => opt.MapFrom(src => src.InvoiceExpenses != null ? src.InvoiceExpenses : new List<InvoiceExpense>()))
            .ForMember(dest => dest.Payments, opt => opt.MapFrom(src => src.Payments != null ? src.Payments : new List<Payment>()));

        CreateMap<InvoiceServiceItem, InvoiceServiceDto>()
            .ForMember(dest => dest.Service, opt => opt.MapFrom(src => src.ServiceName))
            .ForMember(dest => dest.ServiceId, opt => opt.MapFrom(src => src.ServiceId));

        CreateMap<InvoiceExpense, InvoiceExpenseDto>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
            .ForMember(dest => dest.ExpenseTypeId, opt => opt.MapFrom(src => src.ExpenseTypeId));

        CreateMap<Payment, PaymentDto>()
            .ForMember(dest => dest.Method, opt => opt.MapFrom(src => src.Account != null ? src.Account.Name : string.Empty));

        // Transaction mappings
        CreateMap<Transaction, TransactionDto>()
            .ForMember(dest => dest.Account, opt => opt.MapFrom(src => src.Account != null ? src.Account.Name : string.Empty));

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles, opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name)))
            .ForMember(dest => dest.Permissions, opt => opt.Ignore()); // Will be populated in service

        CreateMap<User, UserInfoDto>();

        // Role mappings
        CreateMap<Role, RoleDto>()
            .ForMember(dest => dest.PermissionIds, opt => opt.MapFrom(src => src.RolePermissions.Select(rp => rp.PermissionId)));

        // Permission mappings
        CreateMap<Permission, PermissionDto>();
    }
}

