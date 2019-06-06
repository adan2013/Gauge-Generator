using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    /// <summary>
    /// Interaction logic for HomeWindow.xaml
    /// </summary>
    public partial class HomeWindow : Window
    {
        public HomeWindow()
        {
            InitializeComponent();
            LoadRecentProjects();
        }

        private void NewButton(object sender, RoutedEventArgs e)
        {
            ((MainWindow)Owner).LoadData("", false);
            DialogResult = true;
        }

        private void OpenButton(object sender, RoutedEventArgs e)
        {
            OpenFileDialog opn = new OpenFileDialog
            {
                Multiselect = false,
                Filter = "Gauge Generator Project (*.ggp)|*.ggp"
            };
            if ((bool)opn.ShowDialog())
            {
                ((MainWindow)Owner).LoadData(opn.FileName, false);
                DialogResult = true;
            }
        }

        private void TutorialsButton(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Process.Start("https://adan2013.github.io/Gauge-Generator/examples/");
        }
        
        private void LoadRecentProjects()
        {
            recent0.Content = "Empty slot";
            recent1.Content = "Empty slot";
            recent2.Content = "Empty slot";
            recent3.Content = "Empty slot";
            List<string> l = Global.rp_container.GetItems();
            if (l.Count > 0) recent0.Content = new System.IO.FileInfo(l[0]).Name;
            if (l.Count > 1) recent1.Content = new System.IO.FileInfo(l[1]).Name;
            if (l.Count > 2) recent2.Content = new System.IO.FileInfo(l[2]).Name;
            if (l.Count > 3) recent3.Content = new System.IO.FileInfo(l[3]).Name;
        }

        private void RecentClick(object sender, RoutedEventArgs e)
        {
            int number = Convert.ToInt32(((Button)sender).Tag);
            List<string> l = Global.rp_container.GetItems();
            if (number < l.Count)
            {
                if (System.IO.File.Exists(l[number]))
                {
                    ((MainWindow)Owner).LoadData(l[number], false);
                    DialogResult = true;
                }
                else
                {
                    MessageBox.Show("Project file not found! The position will be deleted", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    Global.rp_container.DeleteItem(number);
                    Global.rp.CheckChanges();
                    Global.rp.SaveChanges();
                    LoadRecentProjects();
                }
            }
        }
    }
}
