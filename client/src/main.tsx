import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import GlobalStyles from "./components/GlobalStyles/GlobalStyles.tsx";
import { ContractProvider } from "./contexts/ContractContext.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { store } from "./redux/store.ts";

createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <AuthProvider>
            <ContractProvider>
                <GlobalStyles>
                    <App />
                </GlobalStyles>
            </ContractProvider>
        </AuthProvider>
    </Provider>,
);
