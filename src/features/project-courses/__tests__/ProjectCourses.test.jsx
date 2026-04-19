import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ProjectCourses from "../../../pages/ProjectCourses";

const fillCourseForm = async (user, title) => {
  await user.type(screen.getByLabelText("Title"), title);
  await user.type(screen.getByLabelText("Instructor"), "Test Instructor");
  await user.type(
    screen.getByLabelText("Description"),
    "This is a detailed description for reliable integration testing coverage."
  );
  await user.clear(screen.getByLabelText("Lessons"));
  await user.type(screen.getByLabelText("Lessons"), "12");
  await user.clear(screen.getByLabelText("Students"));
  await user.type(screen.getByLabelText("Students"), "99");
  await user.type(screen.getByLabelText("Tags (comma separated)"), "testing, qa-course");
};

describe("ProjectCourses page", () => {
  it("supports create, edit, delete and undo flows", async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    render(<ProjectCourses />);

    await user.click(screen.getByRole("button", { name: "New course" }));
    await fillCourseForm(user, "Automation QA Bootcamp");

    const createButton = screen.getByRole("button", { name: "Create course" });
    expect(createButton).toBeEnabled();
    await user.click(createButton);

    expect(await screen.findByText("Automation QA Bootcamp")).toBeInTheDocument();

    const createdRow = screen.getByText("Automation QA Bootcamp").closest("tr");
    await user.click(within(createdRow).getByRole("button", { name: "Edit" }));

    const titleInput = screen.getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Automation QA Bootcamp v2");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Automation QA Bootcamp v2")).toBeInTheDocument();

    const undoButtonsAfterEdit = screen.getAllByRole("button", { name: "Undo" });
    await user.click(undoButtonsAfterEdit[undoButtonsAfterEdit.length - 1]);

    expect(await screen.findByText("Automation QA Bootcamp")).toBeInTheDocument();

    const rowAfterUndo = screen.getByText("Automation QA Bootcamp").closest("tr");
    await user.click(within(rowAfterUndo).getByRole("button", { name: "Delete" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(screen.queryByText("Automation QA Bootcamp")).not.toBeInTheDocument()
    );

    const undoButtonsAfterDelete = screen.getAllByRole("button", { name: "Undo" });
    await user.click(undoButtonsAfterDelete[undoButtonsAfterDelete.length - 1]);

    expect(await screen.findByText("Automation QA Bootcamp")).toBeInTheDocument();
  });

  it("honors keyboard shortcuts", async () => {
    window.localStorage.clear();
    const user = userEvent.setup();
    render(<ProjectCourses />);

    await user.keyboard("{Control>}k{/Control}");
    expect(screen.getByLabelText("Search courses")).toHaveFocus();

    await user.keyboard("{Control>}n{/Control}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await user.keyboard("2");
    expect(screen.getByText("React Frontend Engineering was published.")).toBeInTheDocument();
  });
});
