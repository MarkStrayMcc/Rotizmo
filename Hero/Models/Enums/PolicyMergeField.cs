namespace Hero.Models.Enums
{
    public static class PolicyMergeField
    {
        public const string EncryptedDocumentsHtml = @"<tr>
                                                            <td bgcolor=""#e2f3f9"" style=""padding: 10px; text-align: left; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; border-radius: 25% 10%;"">
                                                                <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 0 14px 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;""><strong>Important – the policy documents are encrypted to protect the Insured</strong></p>
                                                                <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 0 14px 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;""><strong>For the Insured to view the encrypted documents</strong> they will need to use their unique password which is available to them via our Incident Response App</p>
                                                                <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 0 14px 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;"">The attached flyer explains how the app can be downloaded and the Insured will need their policy number to log in: [[PolicyNumber]]</p>
                                                                <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 0 14px 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;"">Please encourage the Insured not to save their policy document in an obviously named folder such as “cyber insurance” or “cyber policy”</p>
                                                                <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;"">Your unique password to access the encrypted documents is [[EncryptedDocumentsKey]]. <strong>Please do not forward this password</strong> to the Insured. This will increase the cyber risk around their policy</p>
                                                            </td>
                                                        </tr>";
        public const string CommissionHtml = @"<tr>
                                                    <td bgcolor=""#ffffff"" style=""padding: 0 3px; text-align: left; mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important;"">
                                                        <p style=""-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0 0 14px 0; font-family: Verdana, sans-serif; font-size: 14px; line-height: 125%; color: rgb(0, 0, 0); font-weight: 400;"">Commission payable on this policy is [[Commission]] of the premium. No commission is payable on the policy fee as this is 100% retained by CFC.</p>
                                                    </td>
                                                </tr>";
    }
}
