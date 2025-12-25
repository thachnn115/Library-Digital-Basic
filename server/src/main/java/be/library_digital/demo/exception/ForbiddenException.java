package be.library_digital.demo.exception;

public class ForbiddenException extends RuntimeException{
    public ForbiddenException(String mess){
        super(mess);
    }
}
