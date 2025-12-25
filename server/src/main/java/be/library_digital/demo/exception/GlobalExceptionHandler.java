package be.library_digital.demo.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.sql.SQLIntegrityConstraintViolationException;
import java.util.Date;

import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({AccessDeniedException.class, ForbiddenException.class})
    @ResponseStatus(FORBIDDEN)
    public ErrorResponse handleAccessDeniedException(Exception e, WebRequest request){

        return ErrorResponse.builder()
                .timestamp(new Date())
                .status(FORBIDDEN.value())
                .error(FORBIDDEN.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=",""))
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(AuthenticationException.class)
    @ResponseStatus(UNAUTHORIZED)
    public ErrorResponse handleAuthenticationException(Exception e, WebRequest request){

        return ErrorResponse.builder()
                .timestamp(new Date())
                .status(UNAUTHORIZED.value())
                .error(UNAUTHORIZED.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=",""))
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorResponse handleAccessDeniedException(BadRequestException e, WebRequest request){

        return ErrorResponse.builder()
                .timestamp(new Date())
                .status(BAD_REQUEST.value())
                .error(BAD_REQUEST.getReasonPhrase())
                .path(request.getDescription(false).replace("uri=",""))
                .message(e.getMessage())
                .build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(NOT_FOUND)
    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(NOT_FOUND.value());
        errorResponse.setError(NOT_FOUND.getReasonPhrase());
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(NOT_FOUND)
    public ErrorResponse handleUsernameNotFoundException(UsernameNotFoundException e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(NOT_FOUND.value());
        errorResponse.setError(NOT_FOUND.getReasonPhrase());
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

    @ExceptionHandler({ConstraintViolationException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentNotValidException.class
    })
    @ResponseStatus(BAD_REQUEST)
    public ErrorResponse handleValidationException(Exception e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(BAD_REQUEST.value());
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));

        String message = e.getMessage();
        if (e instanceof MethodArgumentNotValidException) {
            int start = message.lastIndexOf("[") + 1;
            int end = message.lastIndexOf("]") - 1;
            message = message.substring(start, end);
            errorResponse.setError("Invalid Payload");
            errorResponse.setMessage(message);
        } else if (e instanceof MissingServletRequestParameterException) {
            errorResponse.setError("Invalid Parameter");
            errorResponse.setMessage(message);
        } else if (e instanceof ConstraintViolationException) {
            errorResponse.setError("Invalid Parameter");
            errorResponse.setMessage(message.substring(message.indexOf(" ") + 1));
        } else {
            errorResponse.setError("Invalid Data");
            errorResponse.setMessage(message);
        }

        return errorResponse;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorResponse handleIllegalArgumentException(IllegalArgumentException e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(BAD_REQUEST.value());
        errorResponse.setError("Invalid Input");
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }

//    @ExceptionHandler({MailException.class, MessagingException.class})
//    @ResponseStatus(INTERNAL_SERVER_ERROR)
//    public ErrorResponse handleSendMailException(Exception e, WebRequest request){
//        ErrorResponse errorResponse = new ErrorResponse();
//        errorResponse.setTimestamp(new Date());
//        errorResponse.setStatus(INTERNAL_SERVER_ERROR.value());
//        errorResponse.setError("Failed to send email");
//        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
//        errorResponse.setMessage(e.getMessage());
//
//        return errorResponse;
//    }

    @ExceptionHandler(SQLIntegrityConstraintViolationException.class)
    @ResponseStatus(BAD_REQUEST)
    public ErrorResponse handleSQLIntegrityConstraintViolationException(
            SQLIntegrityConstraintViolationException e, WebRequest request)
    {
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(BAD_REQUEST.value());
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));

        String message = e.getMessage();
        errorResponse.setMessage(message);
        if (message.contains("Duplicate entry")) {
            errorResponse.setError("Duplicate Entry");
        } else if (message.contains("Foreign Key Constraint Violation")) {
            errorResponse.setError("Foreign Key Constraint Violation");
        } else if (message.contains("cannot be null")) {
            errorResponse.setError("Null Value Constraint");
        } else {
            errorResponse.setError("Database Constraint Violation");
        }

        return errorResponse;
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(INTERNAL_SERVER_ERROR)
    public ErrorResponse handleException(Exception e, WebRequest request){
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setTimestamp(new Date());
        errorResponse.setStatus(INTERNAL_SERVER_ERROR.value());
        errorResponse.setError("Internal_server_error");
        errorResponse.setPath(request.getDescription(false).replace("uri=", ""));
        errorResponse.setMessage(e.getMessage());

        return errorResponse;
    }
}
