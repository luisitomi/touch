using Solution.Common;
using Solution.Common.Exception;
using Solution.Common.Exceptions;
using Solution.Core.DTOs;
using System.Net;
using System.Text.Json;

namespace Solution.API.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (FunctionalException ex)
        {
            string txId = Guid.NewGuid().ToString();
            _logger.LogWarning("Tx: {TxId} | Funcional: {Message}", txId, ex.Message);
            await HandleExceptionAsync(context, ex.FunctionalCode, ex.Message, txId, HttpStatusCode.BadRequest);
        }
        catch (DbUpdateConcurrencyException ex)
        {
            string txId = Guid.NewGuid().ToString();
            _logger.LogWarning("Tx: {TxId} | Concurrencia: {Message}", txId, ex.Message);
            await HandleExceptionAsync(context, "CONFLICT_409", ex.Message, txId, HttpStatusCode.Conflict);
        }
        catch (TechnicalException ex)
        {
            string txId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Tx: {TxId} | Técnico: {Message}", txId, ex.Message);
            await HandleExceptionAsync(context, ex.ErrorCode, ex.Message, txId, HttpStatusCode.InternalServerError);
        }
        catch (Exception ex)
        {
            string txId = Guid.NewGuid().ToString();
            _logger.LogError(ex, "Tx: {TxId} | No controlado: {Message}", txId, ex.Message);
            await HandleExceptionAsync(context, "SYSTEM_ERROR", ex.Message, txId, HttpStatusCode.InternalServerError);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, string status, string message, string txId, HttpStatusCode statusCode)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new ResponseDto<object>
        {
            Status = status,
            Message = message,
            Data = null,
            TransactionId = txId
        };

        var resultado = JsonSerializer.Serialize(response);
        return context.Response.WriteAsync(resultado);
    }
}