import { COLORS } from '../lib/constants';
 import { useState } from "react";
 import { Mail, Lock, Loader, RefreshCcw } from "lucide-react";
 import { motion } from "framer-motion";
 import axios from "axios";
 
 const UpdateProfilePage = () => {
   const [newEmail, setNewEmail] = useState("");
   const [newPassword, setNewPassword] = useState("");
   const [message, setMessage] = useState("");
   const [loading, setLoading] = useState(false);
 
   const handleSubmit = async (e) => {
     e.preventDefault();
     setMessage("");
     setLoading(true);
     try {
       await axios.put("/api/auth/account-credentials", {
         newEmail,
         newPassword,
       });
       setMessage("Credentials updated successfully!");
     } catch (error) {
       setMessage("Failed to update credentials.");
     } finally {
       setLoading(false);
     }
   };
 
   return (
    <div className="min-h-screen bg-[#0a0a0a]/90 flex items-center justify-center p-4">
    <div className="w-full max-w-md mx-auto">
      <div
        className="bg-[#0a0a0a]/90 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden"
        style={{
          backgroundColor: COLORS.MEDIUM_GRAY,
          margin: "0 auto",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)"
        }}
      >
  
           <div className="bg-gradient-to-r from-green-600 to-gray-700 px-8 sm:py-12">
             <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
             >
               <h2 className="text-3xl font-bold text-white text-center">
                 Update Account
               </h2>
               <p className="text-white text-center mt-2">
                 Change your email or password below
               </p>
             </motion.div>
           </div>
 
    
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
           >
             <div className="p-8">
               <form onSubmit={handleSubmit} className="space-y-6">
 
 
                 <div className="space-y-2">
                   <label htmlFor="email" className="text-sm font-medium text-gray-300">
                     New Email
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Mail className="h-5 w-5 text-gray-400" />
                     </div>
                     <input
                       id="email"
                       type="email"
                       value={newEmail}
                       onChange={(e) => setNewEmail(e.target.value)}
                       className="block w-full pl-10 px-3 py-3 rounded-xl 
                       bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                       focus:outline-none focus:border-transparent transition duration-200"
                       placeholder="yournew@email.com"
                       style={{
                         borderColor: COLORS.NEON_GREEN,
                         borderWidth: '1px'
                       }}
                     />
                   </div>
                 </div>
 
                 <div className="space-y-2">
                   <label htmlFor="password" className="text-sm font-medium text-gray-300">
                     New Password
                   </label>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <Lock className="h-5 w-5 text-gray-400" />
                     </div>
                     <input
                       id="password"
                       type="password"
                       value={newPassword}
                       onChange={(e) => setNewPassword(e.target.value)}
                       className="block w-full pl-10 px-3 py-3 border border-gray-600 rounded-xl 
                       bg-[#0a0a0a]/90 text-gray-100 placeholder-gray-400 
                       focus:outline-none focus:ring-2 focus:ring-gray-500 
                       focus:border-transparent transition duration-200"
                       placeholder="••••••••"
                       style={{
                         borderColor: COLORS.NEON_GREEN,
                         borderWidth: '1px'
                       }}
                     />
                   </div>
                 </div>
 
                 {message && <p className="text-center text-sm" style={{ color: COLORS.NEON_GREEN }}>{message}</p>}
 
                 <button
                   type="submit"
                   disabled={loading}
                   className="w-full py-3 px-4 flex justify-center items-center bg-gradient-to-r 
                   from-green-600 to-gray-700 hover:from-green-700 hover:to-gray-800 
                   text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl 
                   transition duration-200 disabled:opacity-50"
                   style={{ backgroundColor: COLORS.DARK_GRAY }}
                 >
                   {loading ? (
                     <>
                       <Loader className="mr-2 h-5 w-5 animate-spin" />
                       Updating...
                     </>
                   ) : (
                     <>
                       <RefreshCcw className="mr-2 h-5 w-5" />
                       Update Credentials
                     </>
                   )}
                 </button>
               </form>
             </div>
           </motion.div>
         </div>
       </div>
     </div>
   );
 };
 
 export default UpdateProfilePage;