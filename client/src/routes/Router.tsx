import { routers } from "@constants/routes";
import { Route, Routes } from "react-router-dom";

const Routers: React.FC = () => {
  return (
    <Routes>
      {routers.map((router) => {
        if (router.layout) {
          return (
            <Route
              path={router.path}
              element={
                <router.layout>
                  <router.element />
                </router.layout>
              }
            />
          );
        }

        return <Route path={router.path} element={<router.element />} />;
      })}
    </Routes>
  );
};

export default Routers;
