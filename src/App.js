import {
    BrowserRouter,
    Redirect,
    Route,
    Switch,
} from "react-router-dom/cjs/react-router-dom.min";
import { Bejelentkezes } from "./Bejelentkezes";
import { SzallasLista } from "./SzallasLista";
import { SzallasSingle } from "./SzallasSingle";
import "./App.css";

export function App() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/bejelentkezes" exact component={Bejelentkezes} />
                <Route path="/osszes-szallas" exact component={SzallasLista} />
                <Route path="/szallas-:szallasId">
                    {(props) => (
                        <SzallasSingle id={props.match.params.szallasId} />
                    )}
                </Route>
                <Redirect to={"/bejelentkezes"} />
            </Switch>
        </BrowserRouter>
    );
}

export default App