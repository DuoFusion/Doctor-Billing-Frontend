import { useNavigate, useLocation } from "react-router-dom";
import AddCategoryForm from "../../../components/common/category/AddCategoryForm";
import { ROUTES } from "../../../constants/Routes";

const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { id?: string; name?: string } | null) || null;

  return (
    <div className="app-form-layout app-form-layout-compact text-[#29483c]">
      <AddCategoryForm
        initialName={state?.name}
        categoryId={state?.id}
        onClose={() => navigate(ROUTES.CATEGORY.GET_CATEGORIES)}
      />
    </div>
  );
};

export default AddCategory;
