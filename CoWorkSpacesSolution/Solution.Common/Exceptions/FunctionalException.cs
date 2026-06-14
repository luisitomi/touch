namespace Solution.Common.Exception
{
    public class FunctionalException : global::System.Exception
    {
        public string FunctionalCode { get; set; }

        public FunctionalException(string functionalCode, string message) : base(message)
        {
            FunctionalCode = functionalCode;
        }
    }
}
