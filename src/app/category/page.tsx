"use client";
import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import { Tooltip } from "@mui/material";

export interface IExpenseCategory {
  id: number;
  name: string;
}

// Componente de cadastro de categoria
export default function CategoryPage() {
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSuccessDialogOpen, setDeleteSuccessDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<IExpenseCategory | null>(null);

  // Lida com a mudança dos campos do formulário
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // Atualiza os valores do formulário com os dados do input
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  // Torna a primeira letra de cada palavra maiúscula
  function capitalizeWords(e: React.ChangeEvent<HTMLInputElement>) {
    const words = e.target.value.split(" ");
    const lowerCaseWords = ["e", "da", "das", "de", "di", "do", "dos"];

    for (let i = 0; i < words.length; i++) {
      if (lowerCaseWords.includes(words[i].toLowerCase())) {
        words[i] = words[i].toLowerCase();
      } else {
        words[i] =
          words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
      }
    }

    const capitalized = words.join(" ");
    setFormData((prevState) => ({
      ...prevState,
      name: capitalized,
    }));
  }

  // Lida com o envio do formulário
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Evita o recarregamento da página ao enviar o formulário
    event.preventDefault();

    // Limpa a mensagem de erro
    setErrorMessage("");

    // Ativa o loading
    setLoading(true);

    // Simula um atraso no cadastro para exibir o loading
    setTimeout(async () => {
      // Envia os dados do formulário para a API de criação de categoria
      try {
        const response = await fetch("/api/category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        // Guarda a resposta da API
        const data = await response.json();

        // Busca as categorias cadastradas no banco de dados

        // limpa os campos do formulário
        setFormData((prevState) => ({
          ...prevState,
          name: "",
        }));

        // Verifica se a resposta da API foi bem sucedida ou não
        if (response.ok) {
          setDialogOpen(true);
          fetchCategories();
        } else {
          setErrorMessage(data.error);
        }
      } catch (error) {
        console.error("Erro ao tentar criar categoria:", error);
      } finally {
        setLoading(false);
      }
    }, 2000); // 2 segundos de atraso
  }

  // Busca as categorias cadastradas no banco de dados
  async function fetchCategories() {
    setLoading(true);
    try {
      const response = await fetch("/api/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao tentar buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id: number) {
    try {
      await fetch(`/api/category/${id}`, {
        method: "DELETE",
      });
      fetchCategories();
    } catch (error) {
      console.error("Erro ao tentar deletar categoria:", error);
    }
  }

  const handleDeleteClick = (category: IExpenseCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      deleteCategory(selectedCategory.id);
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
    setDeleteSuccessDialogOpen(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Renderiza o formulário de cadastro de categoria
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 shadow-lg w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-md shadow-md w-full max-w-2xl relative"
      >
        {/* h1 */}
        <div>
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            Cadastro de Categoria
          </h1>
        </div>

        {/* Input Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome da Categoria:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e);
              capitalizeWords(e);
            }}
            minLength={6}
            required
            placeholder="Digite o nome da categoria"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Button Submit */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>

        {errorMessage && (
          <div>
            <p className="text-red-500 text-sm italic mt-4">{errorMessage}</p>
          </div>
        )}

        <div>
          {loading ? (
            <div className="flex justify-center mt-8">
              <CircularProgress style={{ color: "#4f46e5" }} />
            </div>
          ) : (
            <TableContainer component={Paper} className="mt-8">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHead>
                  <TableRow className="bg-black">
                    <TableCell
                      className="text-white"
                      sx={{ fontFamily: "cursive", fontSize: 16 }}
                    >
                      Nome
                    </TableCell>
                    <TableCell className="text-white font-semibold text-right"></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-100">
                      <TableCell align="left" sx={{ fontFamily: "cursive", fontSize: 16 }}>{category.name}</TableCell>

                      <TableCell align="right">
                        <Tooltip
                          title="Deletar"
                          arrow
                          componentsProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: "red",
                                color: "white",
                                fontFamily: "cursive",
                                fontSize: 15,
                                fontWeight: 700,
                              },
                            },
                            arrow: {
                              sx: {
                                color: "red",
                              },
                            },
                          }}
                        >
                          <DeleteIcon
                            onClick={() => handleDeleteClick(category)}
                            className="cursor-pointer"
                            sx={{ color: "red" }}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </form>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Sucesso"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Categoria criada com sucesso!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogOpen(false)}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {"Confirmar Exclusão"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Tem certeza que deseja excluir a categoria &quot;
            {selectedCategory?.name}&quot;?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteSuccessDialogOpen}
        onClose={() => setDeleteSuccessDialogOpen(false)}
        aria-labelledby="delete-success-dialog-title"
        aria-describedby="delete-success-dialog-description"
      >
        <DialogTitle id="delete-success-dialog-title">{"Sucesso"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-success-dialog-description">
            Categoria deletada com sucesso!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteSuccessDialogOpen(false)}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
