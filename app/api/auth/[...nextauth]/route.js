import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
    providers:[
        CredentialsProvider({
            name: "credentials",
            credentials:{
                email: {label: "Email", type: "text"},
                password: {label: "Password",type: "password"}
            },
           async authorize(credentials){
            await connectDB()
                const {email,password} = credentials;
                const user = await User.findOne({email})
                if(!user){
                    throw new Error("User Not Found")
                }
               const isMatched = await bcrypt.compare(password,user.password)
               if(!isMatched){
                throw new Error("Incorrect Password")
               }
               if(user.role !== "admin"){
                throw new Error("Unauthorized")
               }
               return{
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
               }
            }
        })
    ],
    pages: {
        signIn: "/login"
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({token,user}){
            if(user){
                token.id = user.id,
                token.role = user.role
            }
            return token;
        },
        async session({session,token}){
            if(token){
                session.user.id = token.id,
                session.user.role = token.role
            }
            return session;
        },
    },
 secret: process.env.NEXTAUTH_SECRET,
};
const handler = NextAuth(authOptions);
export {handler as GET,handler as POST};